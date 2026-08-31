/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Layout } from './components/layout/Layout';
import { Products } from './pages/Products';
import { EditProduct } from './pages/EditProduct';
import { InData } from './pages/InData';
import { PosterRekomendasi } from './pages/PosterRekomendasi';
import { KanbanRnd } from './pages/KanbanRnd';
import { Settings } from './pages/Settings';
import { KetentuanProduk } from './pages/KetentuanProduk';
import { ProductProvider } from './context/ProductContext';
import { KetentuanProvider } from './context/KetentuanContext';
import { PosterProvider } from './context/PosterContext';
import { RndProvider } from './context/RndContext';
import { SettingsProvider } from './context/SettingsContext';
import { FaqProvider } from './context/FaqContext';
import { Faq } from './pages/Faq';

export default function App() {
  return (
    <SettingsProvider>
      <FaqProvider>
        <ProductProvider>
          <PosterProvider>
            <KetentuanProvider>
              <RndProvider>
                <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Navigate to="/products/all" replace />} />
                    <Route path="products/indata" element={<InData />} />
                    <Route path="products/poster-rekomendasi" element={<PosterRekomendasi />} />
                    <Route path="products/ketentuan" element={<KetentuanProduk />} />
                    <Route path="products/:type" element={<Products />} />
                    <Route path="product/new" element={<EditProduct isNew />} />
                    <Route path="product/edit/:id" element={<EditProduct />} />
                    <Route path="rnd" element={<KanbanRnd />} />
                    <Route path="faq" element={<Faq />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                </Routes>
                </BrowserRouter>
              </RndProvider>
            </KetentuanProvider>
          </PosterProvider>
        </ProductProvider>
      </FaqProvider>
    </SettingsProvider>
  );
}
