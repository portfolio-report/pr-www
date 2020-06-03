import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../sequelize'

export class ClientUpdate extends Model {
  public id!: number
  public timestamp!: Date
  public version!: string
  public country!: string | null
  public useragent!: string | null
}

export function initClientUpdate() {
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
}
