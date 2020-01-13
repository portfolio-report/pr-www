import { DataTypes, Model } from 'sequelize'
import { Price, Security, sequelize } from '../sequelize'

export class Market extends Model {
  public id!: number
  public marketCode!: string
  public currencyCode!: string | null
  public firstPriceDate!: Date | null
  public lastPriceDate!: Date | null
  public symbol!: string | null
  public updatePrices!: boolean

  public securityId!: number
  public readonly prices?: Array<Price>
}

export function initMarket() {
  Market.init(
    {
      marketCode: {
        field: 'market_code',
        type: DataTypes.STRING(4),
        allowNull: false,
      },
      currencyCode: {
        field: 'currency_code',
        type: DataTypes.STRING(3),
        allowNull: true,
      },
      firstPriceDate: {
        field: 'first_price_date',
        type: DataTypes.DATEONLY,
      },
      lastPriceDate: {
        field: 'last_price_date',
        type: DataTypes.DATEONLY,
      },
      symbol: DataTypes.STRING(10),
      updatePrices: {
        field: 'update_prices',
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'market',
      timestamps: false,
    }
  )

  // Implicitely add securityId
  Market.belongsTo(Security, {
    onDelete: 'cascade',
    foreignKey: { name: 'securityId', field: 'security_id' },
  })
  Security.hasMany(Market, {
    onDelete: 'cascade',
    foreignKey: { name: 'securityId', field: 'security_id' },
  })
}
