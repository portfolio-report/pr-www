module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.addColumn(
        'markets',
        'firstPriceDate',
        Sequelize.DATEONLY,
        {
          transaction,
        }
      )

      await queryInterface.addColumn(
        'markets',
        'lastPriceDate',
        Sequelize.DATEONLY,
        {
          transaction,
        }
      )

      await queryInterface.sequelize.query(
        `UPDATE markets SET
        firstPriceDate = (SELECT MIN(date) FROM prices WHERE prices.marketId = markets.id),
        lastPriceDate =  (SELECT MAX(date) FROM prices WHERE prices.marketId = markets.id)`,
        { transaction }
      )

      await transaction.commit()
    } catch (err) {
      await transaction.rollback()
      throw err
    }
  },

  down: async (queryInterface, _Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.removeColumn('markets', 'firstPriceDate', {
        transaction,
      })
      await queryInterface.removeColumn('markets', 'lastPriceDate', {
        transaction,
      })

      for (const indexOptions of [
        { fields: ['securityId'] },
        { fields: ['securityId', 'marketCode'], unique: true },
      ]) {
        await queryInterface.addIndex('markets', {
          transaction,
          ...indexOptions,
        })
      }

      await transaction.commit()
    } catch (err) {
      await transaction.rollback()
      throw err
    }
  },
}
