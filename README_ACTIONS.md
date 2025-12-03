
# Build Android APK via GitHub Actions (from iPad)

This repository includes a GitHub Actions workflow that builds a **debug APK** automatically when you push to the `main` branch or trigger the workflow manually.

**Steps to get a downloadable APK using only your iPad (no laptop):**

1. Create a new GitHub repository:
   - Open github.com in Safari (or use GitHub app).
   - Click New repository → name it (e.g. `astramath-app`) → Create repository (do NOT initialize with README).

2. Upload the project files to the repository:
   - On the repository page, click **Add file → Upload files**.
   - Drag & drop all files from this ZIP (you can upload the ZIP contents via iPad Files app) OR use the "Upload files" web UI to select multiple files.
   - Commit the changes to the `main` branch.

3. Trigger the workflow:
   - Go to **Actions** tab in the GitHub repo. The "Android APK Build (Debug)" workflow should start automatically after the push. If not, click the workflow and press **Run workflow**.
   - Wait a few minutes (the build runs on GitHub servers).

4. Download the APK artifact:
   - After the workflow completes, open the workflow run and find the **app-debug-apk** artifact.
   - Click to download `app-debug-apk.zip` which contains `app-debug.apk`.
   - On iPad, you can open the downloaded APK file; to install on Android phone, transfer it or upload to Google Drive and download on your Android device.

**Notes & limitations:**
- This builds a **debug-signed APK** (signed with Android debug keys). It can be installed on Android devices for testing, but **not** suitable for Play Store publishing.
- For Play Store, you'll need a release-signed AAB and a keystore. I can help prepare that next.
- If the workflow fails due to missing `android` folder, Capacitor may not have created the native android project. If so, I can update the repository to include a pre-generated `android` folder — tell me and I will add it (but that increases ZIP size).
