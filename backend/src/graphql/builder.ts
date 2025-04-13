// src/graphql/builder.ts
import SchemaBuilder from "@pothos/core";
import PrismaPlugin from '@pothos/plugin-prisma';
import type PrismaTypes from '../generated/pothos-types';
import RelayPlugin from '@pothos/plugin-relay';
import { prisma } from '../lib/prisma';
import { DateResolver, DateTimeResolver } from 'graphql-scalars';
import { User as PrismaUser } from '@prisma/client';

export interface GraphQLContext {
  prisma: typeof prisma;
  currentUser?: PrismaUser | null;
  auth?: string | null;
}

export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes;
  Context: GraphQLContext;
  Scalars: {
    Date: { Input: Date; Output: Date };
    DateTime: { Input: Date; Output: Date };
  };
}>({
  plugins: [PrismaPlugin, RelayPlugin],
  prisma: {
    client: prisma,
    exposeDescriptions: true,
    filterConnectionTotalCount: true,
  },
  relay: {
    clientMutationId: 'omit',
    cursorType: 'String',
  },
});

builder.addScalarType("Date", DateResolver, {});
builder.addScalarType("DateTime", DateTimeResolver, {});

builder.queryType({});
builder.mutationType({});