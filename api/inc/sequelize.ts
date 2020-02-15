import dbConfig from '../sequelize-config.json'
import { Sequelize, Model, DataTypes, Options } from 'sequelize'
import Debug from 'debug'
const log = Debug('pr-www:sequelize')

export const sequelize = new Sequelize({
  ...dbConfig.development,
  logging: log,
} as Options)

export class Security extends Model {
  public id!: number
  public uuid!: string | null
  public name!: string | null
  public isin!: string | null
  public wkn!: string | null
  public symbolXfra!: string | null
  public symbolXnas!: string | null
  public symbolXnys!: string | null
  public securityType!: 'share' | 'fund' | 'bond' | 'index' | null
  public staged!: boolean

  public readonly markets?: Array<Market>
}

Security.init(
  {
    uuid: {
      type: DataTypes.UUID,
    },
    name: {
      type: DataTypes.STRING,
    },
    isin: {
      type: DataTypes.STRING(12),
    },
    wkn: {
      type: DataTypes.STRING(6),
    },
    symbolXfra: {
      type: DataTypes.STRING(10),
    },
    symbolXnas: {
      type: DataTypes.STRING(10),
    },
    symbolXnys: {
      type: DataTypes.STRING(10),
    },
    securityType: {
      type: DataTypes.ENUM('share', 'fund', 'bond', 'index'),
    },
    staged: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'security',
    timestamps: false,
  }
)

export class Market extends Model {
  public id!: number
  public marketCode!: string
  public currencyCode!: string | null
  public firstPriceDate!: Date | null
  public lastPriceDate!: Date | null
  public symbol!: string | null

  public securityId!: number
  public readonly prices?: Array<Price>
}

Market.init(
  {
    marketCode: {
      type: DataTypes.STRING(4),
      allowNull: false,
    },
    currencyCode: {
      type: DataTypes.STRING(3),
      allowNull: true,
    },
    firstPriceDate: DataTypes.DATEONLY,
    lastPriceDate: DataTypes.DATEONLY,
    symbol: DataTypes.STRING(10),
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

export class Price extends Model {
  public id!: number
  public date!: Date
  public close!: number

  public marketId!: number
}

Price.init(
  {
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    close: {
      type: DataTypes.DECIMAL(10, 4),
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

export class ClientUpdate extends Model {
  public id!: number
  public timestamp!: Date
  public version!: string
  public country!: string | null
  public useragent!: string | null
}

ClientUpdate.init(
  {
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    version: {
      type: DataTypes.STRING(20),
      validate: { len: [0, 20] },
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(2),
    },
    useragent: {
      type: DataTypes.STRING(50),
    },
  },
  {
    sequelize,
    modelName: 'clientUpdate',
    timestamps: false,
  }
)
