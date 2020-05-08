module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.createTable(
        'events',
        {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
          },
          securityId: {
            type: Sequelize.INTEGER,
            references: {
              model: 'securities',
              key: 'id',
            },
            onUpdate: 'cascade',
            onDelete: 'cascade',
          },

          date: { type: Sequelize.DATEONLY, allowNull: false },
          type: {
            type: Sequelize.STRING(10),
            allowNull: false,
          },
          amount: {
            type: Sequelize.DECIMAL(10, 4),
            allowNull: true,
          },
          currencyCode: {
            type: Sequelize.STRING(3),
            allowNull: true,
          },
          ratio: {
            type: Sequelize.STRING(10),
            allowNull: true,
          },
        },
        {
          transaction,
        }
      )

      for (const indexOptions of [
        { fields: ['securityId'] },
        { fields: ['securityId', 'date'] },
        { fields: ['securityId', 'type'] },
      ]) {
        await queryInterface.addIndex('events', {
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
    await queryInterface.dropTable('events')
  },
}
