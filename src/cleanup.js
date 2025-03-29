const os = require('os');
const { execSync } = require('child_process');
const { getInput, setFailed, setOutput } = require('@actions/core');
const fs = require('fs');

try {
    console.log("Starting cleanup");
    const cleanUp = getInput('cleanup');
    const snapshot = getInput('snapshot');
    const incusRemote = getInput('incus_remote');
    const incusProject = getInput('incus_project');
    const vmName = getInput('vm_name');

    console.log(`cleanup: ${cleanUp}`);
    console.log(`snapshot: ${snapshot}`);

    console.log("Stopping VM");
    var stopCmd = `sudo incus stop ${incusRemote}:${vmName} --force --project ${incusProject}`;
    console.log(`stopCmd: ${stopCmd}`);
    execSync(stopCmd, { stdio: 'inherit' });
    console.log("VM stopped");

    if (snapshot === "true") {
        console.log("Snapshotting VM");
        var snapshotCmd = `sudo incus snapshot create ${incusRemote}:${vmName} ${vmName}-snapshot --reuse --no-expiry --project ${incusProject}`;
        console.log(`snapshotCmd: ${snapshotCmd}`);
        execSync(snapshotCmd, { stdio: 'inherit' });
        setOutput('snapshot_name', `${vmName}-snapshot`);
        console.log("Snapshot created");
    }

    if (cleanUp === "true") {
        console.log("Cleaning up VM");
        var cleanUpCmd = `sudo incus delete ${incusRemote}:${vmName} --force --project ${incusProject}`;
        console.log(`cleanUpCmd: ${cleanUpCmd}`);
        execSync(cleanUpCmd, { stdio: 'inherit' });
        console.log("VM deleted");
    }

} catch (error) {
    setFailed(error.message);
}