import Sequelize from 'sequelize'
import Debug from 'debug'
const log = Debug('api:sequelize')

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './db/database.sqlite',
  logging: log,
})

export class Security extends Sequelize.Model {}

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
      allowNull: false,
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

export class ClientUpdate extends Sequelize.Model {}

ClientUpdate.init(
  {
    timestamp: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    version: {
      type: Sequelize.STRING(20),
      validate: { len: [0, 20] },
      allowNull: false,
    },
    country: {
      type: Sequelize.STRING(2),
    },
    useragent: {
      type: Sequelize.STRING(50),
    },
  },
  {
    sequelize,
    modelName: 'clientUpdate',
    timestamps: false,
    indexes: [
      { fields: ['timestamp'] },
      { fields: ['version'] },
      { fields: ['country'] },
    ],
  }
)
