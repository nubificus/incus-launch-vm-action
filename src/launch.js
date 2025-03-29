const os = require('os');
const { execSync } = require('child_process');
const { getInput, setFailed, setOutput } = require('@actions/core');
const fs = require('fs');

try {
    console.log("Starting VM launch");
    const incusRemote = getInput('incus_remote');
    const incusImage = getInput('incus_image');
    const cpuCores = getInput('cpu_cores');
    const memory = getInput('memory');
    const diskSize = getInput('disk_size');
    const incusProfile = getInput('incus_profile');
    const incusProject = getInput('incus_project');
    const vmName = getInput('vm_name');
    const vmDescription = getInput('vm_description');

    console.log(`incus_remote: ${incusRemote}`);
    console.log(`incus_image: ${incusImage}`);
    console.log(`cpu_cores: ${cpuCores}`);
    console.log(`memory: ${memory}`);
    console.log(`disk_size: ${diskSize}`);
    console.log(`incus_profile: ${incusProfile}`);
    console.log(`vm_name: ${vmName}`);
    console.log(`vm_description: ${vmDescription}`);

    // spawn new VM
    var spawnCmd = `sudo incus launch `;
    spawnCmd += `${incusImage} `;
    spawnCmd += `${incusRemote}:${vmName} `;
    spawnCmd += `--project ${incusProject} `;
    spawnCmd += `--profile ${incusProfile} `;
    spawnCmd += `--description "${vmDescription}" `;
    spawnCmd += `-c limits.cpu=${cpuCores} `;
    spawnCmd += `-c limits.memory=${memory}GiB `;
    spawnCmd += `-d root,size=${diskSize}GiB `;
    spawnCmd += `--vm`;
    console.log(`spawnCmd: ${spawnCmd}`);

    execSync(spawnCmd, { stdio: 'inherit' });

    // get VM IP
    var ip = getIP(incusRemote, vmName, incusProject, 30);
    setOutput('incus_vm_ip', ip);
    console.log(`VM IP: ${ip}`);
} catch (error) {
    setFailed(error.message);
}

function extractIP(output) {
    for (const line of output.split(os.EOL)) {
        let trimLine = line.trim();
        trimLine = trimLine.toString()
        trimLine = `${trimLine}`;
        if (trimLine !== "") {
            if (trimLine.includes("inet") && trimLine.includes("global")) {
                trimLine=trimLine.split(":")[1];
                trimLine = trimLine.split("/")[0].trim();
                console.log(`extracted IP: ${trimLine}`);
                return trimLine;
            }
        }
    }
    return "";
}

function getIP(incusRemote, vmName, incusProject, maxRetries) {
    const retries = maxRetries;
    var retry = 0;
    var ip = "";
    var getIpCmd = `sudo incus info ${incusRemote}:${vmName} --project ${incusProject} `;
    console.log(`getIpCmd: ${getIpCmd}`);
    while (true) {
        ip = execSync(getIpCmd, { stdio: 'pipe' }).toString();
        ip = extractIP(ip);
        if (ip !== "") {
            break;
        }
        retry++;
        if (retry === retries) {
            throw new Error("Failed to get IP address");
        }
        execSync("sleep 4", { stdio: 'inherit' });
    }
    return ip;
}