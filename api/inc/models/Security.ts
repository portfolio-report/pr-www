import { DataTypes, Model } from 'sequelize'
import { Event, Market, sequelize } from '../sequelize'

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

  public readonly markets?: Array<Market>
  public readonly events?: Array<Event>
}

export function initSecurity() {
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
    },
    {
      sequelize,
      modelName: 'security',
      timestamps: false,
    }
  )
}
