#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { RustCdkConfigStack } from "../lib/rust-cdk-config-stack";

const app = new cdk.App();
new RustCdkConfigStack(app, "RustCdkConfigStack", {});
