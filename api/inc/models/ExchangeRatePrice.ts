import { Model, DataTypes } from 'sequelize'
import { sequelize, ExchangeRate } from '../sequelize'

export class ExchangeRatePrice extends Model {
  public id!: number
  public date!: Date
  public value!: number

  public exchangeRateId!: number
}

export function initExchangeRatePrice() {
  ExchangeRatePrice.init(
    {
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      value: {
        type: DataTypes.DECIMAL(12, 6),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'exchangeRatePrice',
      timestamps: false,
    }
  )

  ExchangeRatePrice.belongsTo(ExchangeRate, {
    foreignKey: 'exchangeRateId',
    onDelete: 'cascade',
  })
  ExchangeRate.hasMany(ExchangeRatePrice, {
    as: 'prices',
    foreignKey: 'exchangeRateId',
    onDelete: 'cascade',
  })
}
