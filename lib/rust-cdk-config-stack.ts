import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { ID } from "./id";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecsp from "aws-cdk-lib/aws-ecs-patterns";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as rds from "aws-cdk-lib/aws-rds";
import { EngineVersion } from "aws-cdk-lib/aws-opensearchservice";

export class RustCdkConfigStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const i = new ID("dev", "rust_cdk");

    // VPC
    const vpc = new ec2.Vpc(this, i.gen("vpc"), {
      cidr: "10.0.0.0/21",
      natGateways: 0,
      maxAzs: 2,
      subnetConfiguration: [
        {
          name: "public-subnet-1",
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
      ],
    });

    // ECS
    const cluster = new ecs.Cluster(this, i.gen("cluster"), {
      vpc: vpc,
    });

    const taskDef = new ecs.FargateTaskDefinition(this, i.gen("task-def"), {
      cpu: 256,
      memoryLimitMiB: 512,
    });
    const container = taskDef.addContainer(i.gen("rust-cdk-container"), {
      image: ecs.ContainerImage.fromRegistry("ghcr.io/4afs/rust_cdk:master"),
    });
    container.addPortMappings({
      containerPort: 8080,
      protocol: ecs.Protocol.TCP,
    });

    const albedFargate = new ecsp.ApplicationLoadBalancedFargateService(
      this,
      i.gen("albed-fargate"),
      {
        cluster: cluster,
        taskDefinition: taskDef,
        publicLoadBalancer: true,
        assignPublicIp: true,
      },
    );

    albedFargate.targetGroup.configureHealthCheck({
      path: "/hc",
    });

    // // RDS
    // const mysqlUsername = "mysql";
    // const credential = rds.Credentials.fromGeneratedSecret(mysqlUsername);

    // const mysqlEngine = rds.DatabaseInstanceEngine.mysql({
    //   version: rds.MysqlEngineVersion.VER_8_0,
    // });
    // const mysql = new rds.DatabaseInstance(this, i.gen("mysql"), {
    //   vpc: vpc,
    //   engine: mysqlEngine,
    //   credentials: credential,
    //   databaseName: "rust_cdk",
    // });
  }
}
