import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './index.css'
import { ScratchPage } from './transitionNetworkScratch/ScratchPage.tsx'
import { CytoscapePage } from './transitionNetworkCytoscape/CytoscapePage.tsx'
import { GoJsPage } from './transitionNetworkGoJs/GoJsPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/transition-network" replace />} />
        <Route path="/transition-network" element={<ScratchPage />} />
        <Route
          path="/transition-network/cytoscape"
          element={<CytoscapePage />}
        />
        <Route path="/transition-network/gojs" element={<GoJsPage />} />
        <Route path="*" element={<Navigate to="/transition-network" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
