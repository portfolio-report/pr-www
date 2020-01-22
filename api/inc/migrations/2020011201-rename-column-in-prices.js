module.exports = {
  up: async (queryInterface, _Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.renameColumn('prices', 'value', 'close', {
        transaction,
      })

      for (const indexOptions of [
        { fields: ['marketId'] },
        { fields: ['marketId', 'date'], unique: true },
      ]) {
        await queryInterface.addIndex('prices', {
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
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.renameColumn('prices', 'close', 'value', {
        transaction,
      })

      for (const indexOptions of [
        { fields: ['marketId'] },
        { fields: ['marketId', 'date'], unique: true },
      ]) {
        await queryInterface.addIndex('prices', {
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
