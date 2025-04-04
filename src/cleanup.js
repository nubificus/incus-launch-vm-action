const { execSync } = require('child_process');
const { getInput, setFailed, setOutput } = require('@actions/core');

try {
    console.log("Starting cleanup");
    var cleanUp = getInput('cleanup');
    const snapshot = getInput('snapshot');
    const incusRemote = getInput('incus_remote');
    const incusProject = getInput('incus_project');
    const vmName = getInput('vm_name');

    console.log(`cleanup: ${cleanUp}`);
    console.log(`snapshot: ${snapshot}`);

    console.log("Stopping VM");
    var stopCmd = `incus stop ${incusRemote}:${vmName} --force --project ${incusProject}`;
    console.log(`stopCmd: ${stopCmd}`);
    execSync(stopCmd, { stdio: 'inherit' });
    console.log("VM stopped");

    if (snapshot === "true") {
        console.log("Snapshotting VM");
        var snapshotCmd = `incus snapshot create ${incusRemote}:${vmName} ${vmName}-snapshot --reuse --no-expiry --project ${incusProject}`;
        console.log(`snapshotCmd: ${snapshotCmd}`);
        execSync(snapshotCmd, { stdio: 'inherit' });
        setOutput('snapshot_name', `${vmName}-snapshot`);
        console.log("Snapshot created");
    }

    const cleanupOverride = process.env.CLEANUP_OVERRIDE;
    if (cleanupOverride === "true" || cleanupOverride === "false") {
        console.log("CLEANUP_OVERRIDE set");
        cleanUp = cleanupOverride;
    }
    console.log(`cleanup: ${cleanUp}`);
    if (cleanUp === 'true'){
        console.log("Cleaning up VM");
        var cleanUpCmd = `incus delete ${incusRemote}:${vmName} --force --project ${incusProject}`;
        console.log(`cleanUpCmd: ${cleanUpCmd}`);
        execSync(cleanUpCmd, { stdio: 'inherit' });
        console.log("VM deleted");
    }

} catch (error) {
    setFailed(error.message);
}