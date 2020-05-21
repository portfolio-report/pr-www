import { Model, DataTypes } from 'sequelize'
import { sequelize, Security } from '../sequelize'

export class Event extends Model {
  public id!: number
  public date!: Date
  public type!: string

  public amount!: number | null
  public currencyCode!: string | null
  public ratio!: string | null

  public securityId!: number
}

export function initEvent() {
  Event.init(
    {
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: true,
      },
      currencyCode: {
        type: DataTypes.STRING(3),
        allowNull: true,
      },
      ratio: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'event',
      timestamps: false,
    }
  )

  // Implicitely add securityId
  Event.belongsTo(Security, { onDelete: 'cascade' })
  Security.hasMany(Event, { onDelete: 'cascade' })
}
