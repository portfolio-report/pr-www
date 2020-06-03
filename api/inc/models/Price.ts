import { DataTypes, Model } from 'sequelize'
import { Market, sequelize } from '../sequelize'

export class Price extends Model {
  public id!: number
  public date!: Date
  public close!: number

  public marketId!: number
}

export function initPrice() {
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
}
