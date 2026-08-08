// Resume versioning and history management
const VERSION_KEY = 'cv-generator-versions';
const MAX_VERSIONS = 50;

export function saveVersion(formData, label = '') {
  const versions = getVersions();
  const version = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    label: label || `Version ${versions.length + 1}`,
    data: JSON.parse(JSON.stringify(formData)),
    hash: generateHash(formData)
  };
  
  // Prevent duplicate versions
  if (versions.length > 0 && versions[versions.length - 1].hash === version.hash) {
    return versions;
  }
  
  const updated = [...versions, version].slice(-MAX_VERSIONS);
  localStorage.setItem(VERSION_KEY, JSON.stringify(updated));
  return updated;
}

export function getVersions() {
  try {
    return JSON.parse(localStorage.getItem(VERSION_KEY) || '[]');
  } catch {
    return [];
  }
}

export function restoreVersion(versionId) {
  const versions = getVersions();
  return versions.find(v => v.id === versionId) || null;
}

export function deleteVersion(versionId) {
  const versions = getVersions().filter(v => v.id !== versionId);
  localStorage.setItem(VERSION_KEY, JSON.stringify(versions));
  return versions;
}

export function compareVersions(v1, v2) {
  const diff = {};
  const allKeys = new Set([...Object.keys(v1.data), ...Object.keys(v2.data)]);
  
  allKeys.forEach(key => {
    if (JSON.stringify(v1.data[key]) !== JSON.stringify(v2.data[key])) {
      diff[key] = {
        old: v1.data[key],
        new: v2.data[key]
      };
    }
  });
  
  return diff;
}

function generateHash(data) {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

export function autoSaveVersion(formData, lastSavedRef) {
  const versions = getVersions();
  if (versions.length === 0 || versions[versions.length - 1].hash !== generateHash(formData)) {
    saveVersion(formData, `Auto-save ${new Date().toLocaleTimeString()}`);
    return true;
  }
  return false;
}

export function getVersionStats() {
  const versions = getVersions();
  if (versions.length === 0) return null;
  
  const first = versions[0];
  const last = versions[versions.length - 1];
  const timeSpan = new Date(last.timestamp) - new Date(first.timestamp);
  
  return {
    totalVersions: versions.length,
    firstSave: first.timestamp,
    lastSave: last.timestamp,
    timeSpanDays: Math.round(timeSpan / (1000 * 60 * 60 * 24) * 100) / 100,
    labeledVersions: versions.filter(v => v.label && !v.label.startsWith('Auto-save')).length
  };
}