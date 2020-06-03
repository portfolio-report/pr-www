import { DataTypes, Model } from 'sequelize'
import { ExchangeRatePrice, sequelize } from '../sequelize'

export class ExchangeRate extends Model {
  public id!: number
  public baseCurrencyCode!: string
  public quoteCurrencyCode!: string

  public readonly prices?: Array<ExchangeRatePrice>
}

export function initExchangeRate() {
  ExchangeRate.init(
    {
      baseCurrencyCode: {
        type: DataTypes.STRING(3),
        allowNull: false,
      },
      quoteCurrencyCode: {
        type: DataTypes.STRING(3),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'exchangeRate',
      timestamps: false,
    }
  )
}
