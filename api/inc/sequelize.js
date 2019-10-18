import Sequelize from 'sequelize'
import Debug from 'debug'
const log = Debug('api:sequelize')

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './db/database.sqlite',
  logging: log,
})

export class Security extends Sequelize.Model {
  toApiFormat() {
    return {
      uuid: this.uuid,
      name: this.name,
      isin: this.isin,
      wkn: this.wkn,
      markets: {
        XFRA: { symbol: this.symbolXfra },
        XNAS: { symbol: this.symbolXnas },
        XNYS: { symbol: this.symbolXnys },
      },
      security_type: this.securityType,
    }
  }
}

Security.init(
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
    symbolXfra: {
      type: Sequelize.STRING(10),
    },
    symbolXnas: {
      type: Sequelize.STRING(10),
    },
    symbolXnys: {
      type: Sequelize.STRING(10),
    },
    securityType: {
      type: Sequelize.ENUM('share', 'fund', 'bond', 'index'),
    },
    staged: {
      type: Sequelize.BOOLEAN,
    },
  },
  {
    sequelize,
    modelName: 'security',
    timestamps: false,
    indexes: [
      { fields: ['uuid', 'staged'] },
      { fields: ['name', 'staged'] },
      { fields: ['isin', 'staged'] },
      { fields: ['wkn', 'staged'] },
      { fields: ['symbolXfra', 'staged'] },
      { fields: ['symbolXnas', 'staged'] },
      { fields: ['symbolXnys', 'staged'] },
      { fields: ['securityType', 'staged'] },
    ],
  }
)

Security.sync({ alter: true })
