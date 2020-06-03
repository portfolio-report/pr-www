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
      updatePrices: {
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
  Market.belongsTo(Security, { onDelete: 'cascade' })
  Security.hasMany(Market, { onDelete: 'cascade' })
}
