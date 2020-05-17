module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.createTable(
        'exchangeRates',
        {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
          },
          baseCurrencyCode: {
            type: Sequelize.STRING(3),
            allowNull: false,
          },
          quoteCurrencyCode: {
            type: Sequelize.STRING(3),
            allowNull: false,
          },
        },
        {
          transaction,
        }
      )

      for (const indexOptions of [
        { fields: ['baseCurrencyCode'] },
        { fields: ['quoteCurrencyCode'] },
        { fields: ['baseCurrencyCode', 'quoteCurrencyCode'], unique: true },
      ]) {
        await queryInterface.addIndex('exchangeRates', {
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

  down: async (queryInterface, _Sequelize) => {
    await queryInterface.dropTable('exchangeRates')
  },
}
