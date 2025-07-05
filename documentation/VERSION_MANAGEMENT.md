# Version Management Guide

## ✅ VERSION CONSISTENCY ESTABLISHED

### Current Status
- **Package.json**: 1.3.0
- **Release Log**: 1.3.0
- **Status**: ✅ Synchronized

### Issue Resolved
**Problem**: package.json version (1.0.0) was inconsistent with release log (1.2.5)
**Solution**: Implemented automated version synchronization system

## Automated Version Sync

### Quick Sync Command
```bash
npm run sync-version
```

This command automatically:
1. Reads the latest version from `documentation/RELEASE_LOG.md`
2. Compares with current `package.json` version
3. Updates `package.json` if versions don't match
4. Reports the synchronization status

### Release Command
```bash
npm run release
```

This command:
1. Runs version sync
2. Builds the application with correct version
3. Ensures consistency before deployment

## Multiple Releases Per Day Support

### Timestamp Format
The release log now supports multiple releases per day using timestamps in Copenhagen time:
```
## [1.3.1] - 2025-07-05 16:22:00
## [1.3.0] - 2025-07-05 09:35:00
```

### Required Format
- **Date**: YYYY-MM-DD
- **Time**: HH:MM:SS (24-hour format, Copenhagen time - CET/CEST)
- **Full**: YYYY-MM-DD HH:MM:SS
- **Timezone**: Copenhagen (CET in winter UTC+1, CEST in summer UTC+2)

### Example Multiple Releases
```markdown
## [1.3.2] - 2025-07-05 18:45:00
**Hotfix: Critical Bug Fix**

## [1.3.1] - 2025-07-05 16:22:00
**Version Management Enhancement**

## [1.3.0] - 2025-07-05 09:35:00
**Collapsible Sidebar and Responsive Layout Enhancements**
```

### Best Practices for Multiple Releases
1. **Use meaningful timestamps** - reflect actual release/deployment time in Copenhagen time
2. **Include clear release purpose** - hotfix, feature, enhancement
3. **Maintain chronological order** - newest first
4. **Test sync before deployment** - run `npm run sync-version` after updating release log
5. **Use Copenhagen timezone** - CET (UTC+1) in winter, CEST (UTC+2) in summer

## Manual Version Management

### When to Update Versions

#### Major Version (X.0.0)
- Breaking changes
- Major feature overhauls
- API changes

#### Minor Version (1.X.0) 
- New features
- Significant enhancements
- Non-breaking additions

#### Patch Version (1.2.X)
- Bug fixes
- Small improvements
- Security patches

### Release Process

#### 1. Update Release Log
Add new entry to `documentation/RELEASE_LOG.md`:
```markdown
## [1.4.0] - 2025-07-06 14:30:00
**Feature Name**
### Added
- New feature description
### Changed
- Changes made
### Fixed
- Bug fixes
```

#### 2. Sync Version
```bash
npm run sync-version
```

#### 3. Build and Test
```bash
npm run release
```

#### 4. Verify Consistency
Check that both files show the same version:
- `package.json` → version field
- `documentation/RELEASE_LOG.md` → latest entry

## Version Sync Script Details

### Location
- **Script**: `sync-version.js`
- **Entry**: Added to `package.json` scripts

### How It Works
1. **Reads** `documentation/RELEASE_LOG.md`
2. **Parses** the first version after comment block
3. **Compares** with `package.json` version
4. **Updates** package.json if needed
5. **Reports** status and build version

### Error Handling
- ❌ **No version found**: Exits with error message
- ⚠️ **Version mismatch**: Automatically fixes and reports
- ✅ **Already in sync**: Confirms consistency

## Best Practices

### For Developers
1. **Always update release log first** before changing package.json
2. **Run `npm run sync-version`** before builds
3. **Use semantic versioning** (major.minor.patch)
4. **Date releases** in YYYY-MM-DD HH:MM:SS format using Copenhagen time (CET/CEST)
5. **Include timestamps** for precise release tracking

### For CI/CD
1. Include `npm run sync-version` in build pipeline
2. Fail builds if versions are inconsistent
3. Automatically tag releases with version numbers

### For Deployments
1. Use `npm run release` for production builds
2. Verify version consistency before deployment
3. Include version number in deployment artifacts

## Version Display

### Current Implementation
Version is available in:
- **Package.json**: For npm and build tools
- **Release Log**: For user-facing changelog
- **Build artifacts**: Automatically included

### Future Enhancements
Consider adding version display to:
- Application footer
- About page
- API responses
- Log files

## Troubleshooting

### Version Mismatch Detected
If versions don't match:
1. Run `npm run sync-version`
2. Verify the fix worked
3. Commit the updated package.json

### Script Fails to Find Version
If the script can't find a version:
1. Check `documentation/RELEASE_LOG.md` format
2. Ensure version follows pattern: `## [X.Y.Z] - YYYY-MM-DD`
3. Verify the version is after the comment block

### Manual Override
If you need to manually set a specific version:
```bash
npm version 1.4.0 --no-git-tag-version
```

This approach ensures consistent versioning across all project files and provides automated tools to maintain that consistency.

## Workflow for Multiple Releases

### Daily Release Workflow
When making multiple releases in a single day:

#### 1. Morning Release (Major Feature)
```bash
# 1. Update RELEASE_LOG.md
## [1.4.0] - 2025-07-05 09:00:00
**New Dashboard Analytics**

# 2. Sync and release
npm run release
```

#### 2. Afternoon Hotfix
```bash
# 1. Update RELEASE_LOG.md (add at top)
## [1.4.1] - 2025-07-05 14:30:00
**Critical Bug Fix: Authentication Issue**

# 2. Sync and release
npm run release
```

#### 3. Evening Enhancement
```bash
# 1. Update RELEASE_LOG.md (add at top)
## [1.4.2] - 2025-07-05 18:15:00
**UI Polish: Improved Mobile Navigation**

# 2. Sync and release
npm run release
```

### Version Increment Guidelines
- **Patch (x.x.1)**: Bug fixes, hotfixes, minor tweaks
- **Minor (x.1.x)**: New features, enhancements, significant changes
- **Major (1.x.x)**: Breaking changes, major overhauls

### Production Deployment Checklist
1. ✅ Update RELEASE_LOG.md with timestamp
2. ✅ Run `npm run sync-version` 
3. ✅ Run `npm run release` (includes build)
4. ✅ Verify build success
5. ✅ Test deployment in staging
6. ✅ Deploy to production
7. ✅ Verify version in production
