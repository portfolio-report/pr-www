import Sequelize from 'sequelize'
import Debug from 'debug'
const log = Debug('api:sequelize')

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './db/database.sqlite',
  logging: log,
})

export class StagedSecurity extends Sequelize.Model {}
StagedSecurity.init(
  {
    uuid: {
      type: Sequelize.UUID,
    },
    name: {
      type: Sequelize.STRING,
    },
    isin: {
      type: Sequelize.STRING(12),
    },
    wkn: {
      type: Sequelize.STRING(6),
    },
    symbol_xfra: {
      type: Sequelize.STRING(10),
    },
    security_type: {
      type: Sequelize.ENUM('share', 'fund', 'bond', 'index'),
    },
  },
  {
    sequelize,
    modelName: 'staged_security',
    timestamps: false,
    indexes: [
      { fields: ['uuid'] },
      { fields: ['name'] },
      { fields: ['isin'] },
      { fields: ['wkn'] },
      { fields: ['security_type'] },
    ],
  }
)
StagedSecurity.sync({ alter: true })
