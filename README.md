# incus-launch-vm-action

A simple Github Action to launch an Incus VM using an already configured Incus client.

## Usage

To use the Action, include it in your workflow file:

```yaml
jobs:
  setup_incus:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Incus and Connect to Remote Server
        uses: nubificus/incus-launch-vm-action@v1
        with:
          vm_name: 'test-vm'
          vm_description: 'New VM to run tests'
          incus_remote: 'my-incus-remote'
          incus_image: 'images:ubuntu/22.04/cloud'
          cpu_cores: '2'
          memory: '2' # size in GiB
          disk_size: '10' # size in GiB
          incus_profile: 'default'
          incus_project: 'default'
          cleanup: 'true'
          snapshot: 'true'
```

Additionally to `cleanup` input that is passed at the start of the action, a ENV variable (`CLEANUP_OVERRIDE`) can be set during
the execution of the workflow to override the behavior defined in the input. This allows the user to retain the VM if a specific
condition is met during the next steps of the workflow.

```yaml
    - name: Run ctr tests
      id: test-ctr
      run: |
        export VM_NAME=${{ env.INCUS_CLUSTER }}:${{ env.VM_NAME }}
        export TEST_CMD="cd /root/develop/urunc && PATH=/usr/local/go/bin:$PATH make test_ctr"
        if ! incus exec "$VM_NAME" -- sh -c "$TEST_CMD"; then
          echo "Test failed"
          echo "CLEANUP_OVERRIDE=false" >> $GITHUB_ENV
          exit 1
        fi
```
