
import { supabase } from '@/integrations/supabase/client';

export interface TestLocation {
  id: string;
  name: string;
  address: string;
  city?: string;
  testTypes: string[];
  distance?: string;
  phone?: string;
  website?: string;
  hours?: { day: string; hours: string }[];
  description?: string;
  coordinates?: [number, number];
  category?: string;
  region?: string;
  email?: string;
  social?: Record<string, string>;
  services?: string[];
  images?: string[];
  source?: string;
  lastVerifiedDate?: string;
}

export const fetchLocationById = async (id: string): Promise<TestLocation | null> => {
  try {
    const { data, error } = await supabase
      .from('test_locations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching location details:', error);
      throw error;
    }
    
    if (!data) return null;
    
    // Trasforma i dati da Supabase nel formato dell'applicazione
    return transformLocationData(data);
  } catch (error) {
    console.error('Error fetching location details:', error);
    throw error;
  }
};

export const fetchLocations = async (): Promise<TestLocation[]> => {
  try {
    const { data, error } = await supabase
      .from('test_locations')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching test locations:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      // Se non ci sono dati, inserisci alcuni dati di esempio
      await insertSampleLocations();
      const { data: newData } = await supabase
        .from('test_locations')
        .select('*')
        .order('name');
      
      return (newData || []).map(transformLocationData);
    }
    
    // Trasforma i dati per adattarli al formato dell'applicazione
    return data.map(transformLocationData);
  } catch (error) {
    console.error('Error fetching test locations:', error);
    throw error;
  }
};

// Funzione helper per trasformare i dati da Supabase nel formato dell'applicazione
function transformLocationData(data: any): TestLocation {
  // Estrai la città dall'indirizzo se non è specificata separatamente
  const city = data.region || data.address.split(',').pop()?.trim() || '';
  
  // Converti i servizi in tipi di test se necessario
  const testTypes = data.services || ['HIV', 'Sifilide'];
  
  // Converti le ore di apertura nel formato dell'applicazione se presenti
  let hours;
  if (data.opening_hours) {
    try {
      // Se opening_hours è un campo JSONB, potrebbe essere già un oggetto
      const openingHours = typeof data.opening_hours === 'string' 
        ? JSON.parse(data.opening_hours) 
        : data.opening_hours;
        
      hours = Object.entries(openingHours).map(([day, hoursStr]) => ({
        day,
        hours: String(hoursStr)
      }));
    } catch (e) {
      console.warn('Failed to parse opening hours:', e);
    }
  }
  
  // Converti le coordinate nel formato [lat, lng] se necessario
  let coordinates: [number, number] | undefined;
  if (data.coordinates && Array.isArray(data.coordinates) && data.coordinates.length === 2) {
    coordinates = [Number(data.coordinates[0]), Number(data.coordinates[1])];
  }
  
  return {
    id: data.id,
    name: data.name,
    address: data.address,
    city: city,
    testTypes: testTypes,
    phone: data.contacts,
    website: data.website,
    hours: hours,
    description: data.description,
    coordinates: coordinates,
    category: data.category,
    region: data.region,
    email: data.email,
    social: data.social,
    services: data.services,
    images: data.images,
    source: data.source,
    lastVerifiedDate: data.last_verified_date
  };
}

// Funzione per inserire dati di esempio se la tabella è vuota
async function insertSampleLocations() {
  const sampleLocations = [
    {
      name: "Centro Medico San Raffaele",
      address: "Via Olgettina, 60",
      region: "Milano",
      services: ["HIV", "Sifilide", "Epatite B"],
      contacts: "02 26431",
      website: "https://www.sanraffaele.it",
      description: "Centro specializzato in test per malattie sessualmente trasmissibili con personale medico altamente qualificato.",
      coordinates: [45.5050, 9.2640]
    },
    {
      name: "Laboratorio Analisi Policlinico",
      address: "Via Francesco Sforza, 35",
      region: "Milano",
      services: ["HIV", "Gonorrea", "Clamidia", "HPV"],
      contacts: "02 55031",
      website: "https://www.policlinico.mi.it",
      description: "Laboratorio di analisi con servizio completo per lo screening delle malattie sessualmente trasmissibili.",
      coordinates: [45.4584, 9.1967]
    },
    {
      name: "Centro Diagnostico Italiano",
      address: "Via Saint Bon, 20",
      region: "Milano",
      services: ["HIV", "Epatite C", "Sifilide", "HPV"],
      contacts: "02 48317444",
      website: "https://www.cdi.it",
      opening_hours: {
        "Lunedì-Venerdì": "8:00-19:00",
        "Sabato": "8:00-12:00"
      },
      description: "Centro di riferimento per diagnosi e prevenzione con laboratori all'avanguardia.",
      coordinates: [45.4847, 9.1422]
    },
    {
      name: "Ospedale Sacco - Polo Universitario",
      address: "Via G.B. Grassi, 74",
      region: "Milano",
      services: ["HIV", "Epatite B", "Epatite C", "Sifilide"],
      contacts: "02 39041",
      website: "https://www.asst-fbf-sacco.it",
      description: "Centro specializzato in malattie infettive con esperienza nel trattamento di malattie sessualmente trasmissibili.",
      coordinates: [45.5042, 9.1857]
    },
    {
      name: "Centro Salute ASL Roma 1",
      address: "Via Clauzetto, 175",
      region: "Roma",
      services: ["HIV", "Sifilide", "Gonorrea"],
      contacts: "06 68351",
      website: "https://www.aslroma1.it",
      description: "Centro pubblico per test e consulenze su malattie sessualmente trasmissibili.",
      coordinates: [41.8719, 12.4696]
    },
    {
      name: "Centro Check Point Firenze",
      address: "Via delle Panche, 56",
      region: "Firenze",
      services: ["HIV", "Sifilide"],
      contacts: "055 2693838",
      website: "https://www.checkpointfirenze.it",
      description: "Centro community based per test rapidi HIV e altre IST.",
      coordinates: [43.7992, 11.2377]
    },
    {
      name: "ASL Napoli 1 Centro",
      address: "Via Comunale del Principe, 13",
      region: "Napoli",
      services: ["HIV", "Epatite B", "Sifilide"],
      contacts: "081 2549111",
      website: "https://www.aslnapoli1centro.it",
      description: "Centro di riferimento per test e consulenze su malattie sessualmente trasmissibili.",
      coordinates: [40.8518, 14.2681]
    }
  ];

  for (const location of sampleLocations) {
    const { error } = await supabase
      .from('test_locations')
      .insert([location]);
      
    if (error) {
      console.error('Error inserting sample location:', error);
    }
  }
}
