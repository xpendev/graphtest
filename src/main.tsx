import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './index.css'
import { BrandDivergingBPage } from './brandDivergingAgCharts/BrandDivergingBPage.tsx'
import { HomePage } from './HomePage.tsx'
import { ScratchPage } from './transitionNetworkScratch/ScratchPage.tsx'
import { CytoscapePage } from './transitionNetworkCytoscape/CytoscapePage.tsx'
import { GoJsPage } from './transitionNetworkGoJs/GoJsPage.tsx'
import { AgChartsPage } from './transitionNetworkAgCharts/AgChartsPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/transition-network" element={<ScratchPage />} />
        <Route
          path="/transition-network/cytoscape"
          element={<CytoscapePage />}
        />
        <Route path="/transition-network/gojs" element={<GoJsPage />} />
        <Route
          path="/transition-network/agcharts"
          element={<AgChartsPage />}
        />
        <Route path="/brand-diverging" element={<BrandDivergingBPage />} />
        <Route
          path="/brand-diverging-b"
          element={<Navigate to="/brand-diverging" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
