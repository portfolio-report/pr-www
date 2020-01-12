import Sequelize from 'sequelize'
import Debug from 'debug'
import * as dbConfig from '../sequelize-config.json'
const log = Debug('api:sequelize')

export const sequelize = new Sequelize({
  ...dbConfig.development,
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
  }
)

export class Market extends Sequelize.Model {}

Market.init(
  {
    marketCode: {
      type: Sequelize.STRING(4),
      allowNull: false,
    },
    currencyCode: {
      type: Sequelize.STRING(3),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'market',
    timestamps: false,
  }
)

// Implicitely add securityId
Market.belongsTo(Security, { onDelete: 'cascade' })
Security.hasMany(Market, { onDelete: 'cascade' })

export class Price extends Sequelize.Model {}

Price.init(
  {
    date: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    },
    close: {
      type: Sequelize.DECIMAL(10, 4),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'price',
    timestamps: false,
  }
)

Price.belongsTo(Market, { onDelete: 'cascade' })
Market.hasMany(Price, { onDelete: 'cascade' })

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
  }
)
