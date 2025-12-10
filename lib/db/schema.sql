-- Schéma de base de données pour CES'Event Campus Tracker
-- PostgreSQL / Neon Database

-- Extension pour UUID (si nécessaire)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table principale des donations
CREATE TABLE IF NOT EXISTS donations (
  -- Identifiant unique (clé primaire)
  id VARCHAR(255) PRIMARY KEY,  -- ID depuis Streamlabs (ex: "donation_12345")

  -- Informations du donateur
  name VARCHAR(500) NOT NULL,
  email VARCHAR(500),
  message TEXT DEFAULT '',

  -- Montant de la donation
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  currency VARCHAR(10) NOT NULL DEFAULT 'EUR',

  -- Timestamps
  timestamp BIGINT NOT NULL,  -- Timestamp Unix de la donation
  verified BOOLEAN DEFAULT true,

  -- Parsing du campus
  campus_id VARCHAR(100),
  campus_name VARCHAR(255),
  campus_confidence DECIMAL(3, 2) DEFAULT 0 CHECK (campus_confidence >= 0 AND campus_confidence <= 1),

  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_donations_timestamp ON donations(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_donations_campus_id ON donations(campus_id) WHERE campus_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_donations_amount ON donations(amount DESC);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_campus_timestamp ON donations(campus_id, timestamp DESC) WHERE campus_id IS NOT NULL;

-- Vue pour les statistiques par campus
CREATE OR REPLACE VIEW campus_stats AS
SELECT
  campus_id,
  campus_name,
  COUNT(*) as donation_count,
  SUM(amount) as total_amount,
  AVG(amount) as average_amount,
  MIN(amount) as min_amount,
  MAX(amount) as max_amount,
  MIN(created_at) as first_donation,
  MAX(created_at) as last_donation
FROM donations
WHERE campus_id IS NOT NULL
GROUP BY campus_id, campus_name
ORDER BY total_amount DESC;

-- Vue pour les statistiques globales
CREATE OR REPLACE VIEW global_stats AS
SELECT
  COUNT(*) as total_donations,
  SUM(amount) as total_amount,
  AVG(amount) as average_amount,
  MIN(amount) as min_amount,
  MAX(amount) as max_amount,
  COUNT(DISTINCT campus_id) as campus_count,
  MIN(created_at) as first_donation,
  MAX(created_at) as last_donation,
  SUM(CASE WHEN campus_id IS NULL THEN 1 ELSE 0 END) as unidentified_count,
  SUM(CASE WHEN campus_id IS NULL THEN amount ELSE 0 END) as unidentified_amount
FROM donations;

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour updated_at
DROP TRIGGER IF EXISTS update_donations_updated_at ON donations;
CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON donations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Commentaires sur les tables et colonnes
COMMENT ON TABLE donations IS 'Stockage de toutes les donations reçues via Streamlabs';
COMMENT ON COLUMN donations.id IS 'Identifiant unique de la donation depuis Streamlabs';
COMMENT ON COLUMN donations.timestamp IS 'Timestamp Unix de la donation (depuis Streamlabs)';
COMMENT ON COLUMN donations.campus_id IS 'Identifiant du campus identifié dans le message';
COMMENT ON COLUMN donations.campus_confidence IS 'Niveau de confiance du parsing (0-1)';
COMMENT ON VIEW campus_stats IS 'Statistiques agrégées par campus';
COMMENT ON VIEW global_stats IS 'Statistiques globales de toutes les donations';
