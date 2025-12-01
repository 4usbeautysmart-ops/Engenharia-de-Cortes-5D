export interface CatalogStyle {
  id: string;
  name: string;
  url: string;
}

export interface CatalogData {
  [category: string]: CatalogStyle[];
}

// Using curated, high-quality images from Pexels/Unsplash to better represent each haircut.
export const catalogData: CatalogData = {
  "Feminino Longo": [
    { id: "fl1", name: "Longo em Camadas", url: "https://images.pexels.com/photos/3763321/pexels-photo-3763321.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { id: "fl2", name: "Ondas de Sereia", url: "https://images.pexels.com/photos/3997388/pexels-photo-3997388.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { id: "fl3", name: "Liso com Franja", url: "https://images.pexels.com/photos/1381556/pexels-photo-1381556.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { id: "fl4", name: "Cacheado Volumoso", url: "https://images.pexels.com/photos/1115680/pexels-photo-1115680.jpeg?auto=compress&cs=tinysrgb&w=600" },
  ],
  "Feminino Médio": [
    { id: "fm1", name: "Long Bob", url: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { id: "fm2", name: "Shag Hair", url: "https://images.pexels.com/photos/705255/pexels-photo-705255.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { id: "fm3", name: "Clavicut Liso", url: "https://images.pexels.com/photos/1251844/pexels-photo-1251844.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { id: "fm4", name: "Médio Cacheado", url: "https://images.pexels.com/photos/3992870/pexels-photo-3992870.jpeg?auto=compress&cs=tinysrgb&w=600" },
  ],
  "Feminino Curto": [
    { id: "fc1", name: "Pixie Cut", url: "https://images.pexels.com/photos/3772510/pexels-photo-3772510.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { id: "fc2", name: "Short Bob", url: "https://images.pexels.com/photos/1319854/pexels-photo-1319854.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { id: "fc3", name: "Buzz Cut", url: "https://images.pexels.com/photos/4156277/pexels-photo-4156277.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { id: "fc4", name: "Micro Franja", url: "https://images.pexels.com/photos/761297/pexels-photo-761297.jpeg?auto=compress&cs=tinysrgb&w=600" },
  ],
  "Afro": [
    { id: "af1", name: "Black Power", url: "https://images.pexels.com/photos/1036627/pexels-photo-1036627.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { id: "af2", name: "Twist Out", url: "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { id: "af3", name: "Dreadlocks", url: "https://images.pexels.com/photos/2033343/pexels-photo-2033343.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { id: "af4", name: "Tranças Boxeadoras", url: "https://images.pexels.com/photos/7135319/pexels-photo-7135319.jpeg?auto=compress&cs=tinysrgb&w=600" },
  ],
  "Masculino": [
    { id: "m1", name: "Fade com Topete", url: "https://images.pexels.com/photos/1321943/pexels-photo-1321943.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { id: "m2", name: "Undercut", url: "https://images.pexels.com/photos/2853592/pexels-photo-2853592.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { id: "m3", name: "Médio Natural", url: "https://images.pexels.com/photos/3768913/pexels-photo-3768913.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { id: "m4", name: "Crew Cut", url: "https://images.pexels.com/photos/2530775/pexels-photo-2530775.jpeg?auto=compress&cs=tinysrgb&w=600" },
  ],
  "Infantil": [
    { id: "i1", name: "Menino Moderno", url: "https://images.pexels.com/photos/5676348/pexels-photo-5676348.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { id: "i2", name: "Menina com Franja", url: "https://images.pexels.com/photos/1648377/pexels-photo-1648377.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { id: "i3", name: "Cacheado Infantil", url: "https://images.pexels.com/photos/3931563/pexels-photo-3931563.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { id: "i4", name: "Menina Longo", url: "https://images.pexels.com/photos/3931638/pexels-photo-3931638.jpeg?auto=compress&cs=tinysrgb&w=600" },
  ]
};