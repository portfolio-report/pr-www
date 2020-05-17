module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.createTable(
        'exchangeRatePrices',
        {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
          },
          date: { type: Sequelize.DATEONLY, allowNull: false },
          value: {
            type: Sequelize.DECIMAL(12, 6),
            allowNull: false,
          },
          exchangeRateId: {
            type: Sequelize.INTEGER,
            references: {
              model: 'exchangeRates',
              key: 'id',
            },
            onUpdate: 'cascade',
            onDelete: 'cascade',
          },
        },
        {
          transaction,
        }
      )

      for (const indexOptions of [
        { fields: ['exchangeRateId'] },
        { fields: ['exchangeRateId', 'date'], unique: true },
      ]) {
        await queryInterface.addIndex('exchangeRatePrices', {
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
    await queryInterface.dropTable('exchangeRatePrices')
  },
}
