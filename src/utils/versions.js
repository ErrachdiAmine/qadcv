// Resume versioning and history management
const VERSION_KEY = 'cv-generator-versions';
const MAX_VERSIONS = 50;

export function saveVersion(formData, label = '') {
  const versions = getVersions();
  const version = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    created_at: new Date().toISOString(),
    version_number: versions.length + 1,
    label: label || `Version ${versions.length + 1}`,
    data: JSON.parse(JSON.stringify(formData)),
    hash: generateHash(formData),
    is_auto: false
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

// Enhanced: Diff two versions and return a readable summary
export function getVersionDiff(versionId1, versionId2) {
  const versions = getVersions();
  const v1 = versions.find(v => v.id === versionId1);
  const v2 = versions.find(v => v.id === versionId2);
  if (!v1 || !v2) return null;
  return compareVersions(v1, v2);
}

// Enhanced: Get summary of changes between versions
export function getChangesSummary(diff) {
  if (!diff) return [];
  const changes = [];
  Object.entries(diff).forEach(([key, { old, new: newVal }]) => {
    if (Array.isArray(old) && Array.isArray(newVal)) {
      const added = newVal.filter(item => !old.includes(item));
      const removed = old.filter(item => !newVal.includes(item));
      if (added.length > 0) changes.push(`Added to ${key}: ${added.join(', ')}`);
      if (removed.length > 0) changes.push(`Removed from ${key}: ${removed.join(', ')}`);
    } else if (typeof old === 'string' && typeof newVal === 'string') {
      if (old !== newVal) changes.push(`${key}: "${old.substring(0, 50)}..." → "${newVal.substring(0, 50)}..."`);
    } else if (old !== newVal) {
      changes.push(`${key} changed`);
    }
  });
  return changes;
}

// Enhanced: Auto-cleanup old auto-saves, keep only labeled + recent auto
export function cleanupVersions(keepLabeled = true, maxAutoSaves = 10) {
  const versions = getVersions();
  const labeled = versions.filter(v => v.label && !v.label.startsWith('Auto-save'));
  const autoSaves = versions.filter(v => v.label && v.label.startsWith('Auto-save')).slice(-maxAutoSaves);
  const updated = [...labeled, ...autoSaves].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  localStorage.setItem(VERSION_KEY, JSON.stringify(updated));
  return updated;
}