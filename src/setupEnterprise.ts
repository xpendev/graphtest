import { ModuleRegistry } from 'ag-grid-community'
import {
  AllEnterpriseModule as GridAllEnterpriseModule,
  LicenseManager as GridLicenseManager,
} from 'ag-grid-enterprise'
import {
  AllEnterpriseModule as ChartsAllEnterpriseModule,
  LicenseManager as ChartsLicenseManager,
  ModuleRegistry as ChartsModuleRegistry,
} from 'ag-charts-enterprise'

const key = import.meta.env.VITE_AG_LICENSE_KEY as string | undefined

if (key) {
  GridLicenseManager.setLicenseKey(key)
  ChartsLicenseManager.setLicenseKey(key)
} else {
  console.warn(
    '[AG Enterprise] VITE_AG_LICENSE_KEY が未設定です。.env を確認してください。',
  )
}

ModuleRegistry.registerModules([GridAllEnterpriseModule])
ChartsModuleRegistry.registerModules([ChartsAllEnterpriseModule])
