import * as cdktf from "cdktf";
import { Construct } from "constructs";
import { BaseStack, Stack } from "cdktf-multi-stack-tfe";

// We need to have an already created "base" TFE workspace as a basis.
// It will store the TFE workspace configuration and state for all stacks.
// As it creates all TFE workspaces, it's required to be created first (and as a result will scaffold out all the required workspaces).
class MyAppBaseStack extends BaseStack {
  // The name is set to my-app-base
  constructor(scope: Construct) {
    // This will configure the remote backend to use my-company/my-app-base as a workspace
    // my-company is the Terraform organization
    // my-app is the prefix to use for all workspaces
    super(scope, "gerald-tfc-business", "app-1", {
      hostname: "app.terraform.io", // can be set to configure a different Terraform Cloud hostname, e.g. for privately hosted Terraform Enterprise
      token: "my-token", // READ from environment variable
    });

    // You can do additional things in this stack as well
  }
}

class Networking extends Stack {
  public vnetId: string

  // This stack will depend on the base stack and it
  // will use the my-company/my-app-$stackName workspace as a backend
  constructor(scope: Construct, stackName: string) {
    super(scope, stackName);

    // Setup a VNET, pass VNET ID to App Service etc.
    // let vnetId = ...

  }
}

class AppService extends Stack {
  constructor(scope: Construct, stackName: string, vnetId: string) {
    super(scope, stackName);

    // Setup yourwebapp using the vpcId
  }
}

const app = new cdktf.App();
new MyAppBaseStack(app); // the stack name is "base"

// This cross-stack reference will lead to permissions being set up so that
// the staging-web workspace can access the staging-vpc workspace.
const devVpc = new Networking(app, "staging-vpc"); // the stack name is "staging-vpc"
new AppService(app, "dev-web", devVpc.vpcId); // the stack name is "staging-web"

const vpc = new Networking(app, "staging-vpc"); // the stack name is "staging-vpc"
new AppService(app, "staging-web", vpc.vpcId); // the stack name is "staging-web"

const prodVpc = new Networking(app, "production-vpc");
new AppService(app, "production-web", prodVpc.vpcId);

app.synth();
