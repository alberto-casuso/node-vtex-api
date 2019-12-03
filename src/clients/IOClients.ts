import {
  Apps,
  Assets,
  Billing,
  BillingMetrics,
  Builder,
  Events,
  ID,
  LicenseManager,
  Logger,
  Messages,
  MessagesGraphQL,
  Metadata,
  Registry,
  Router,
  Segment,
  Session,
  Settings,
  VBase,
  Workspaces,
} from '.'
import { InstanceOptions, IOClient, IOClientConstructor } from '../HttpClient'
import { IOContext } from '../service/typings'
import { TenantClient } from './Tenant'

export type ClientsImplementation<T extends IOClients> = new (
  clientOptions: Record<string, InstanceOptions>,
  ctx: IOContext
) => T

export class IOClients {
  private clients: Record<string, IOClient> = {}

  constructor(
    private clientOptions: Record<string, InstanceOptions>,
    private ctx: IOContext
  ) { }

  public get apps() {
    return this.getOrSet('apps', Apps)
  }

  public get assets() {
    return this.getOrSet('assets', Assets)
  }

  public get billing() {
    return this.getOrSet('billing', Billing)
  }

  public get billingMetrics() {
    return this.getOrSet('billingMetrics', BillingMetrics)
  }

  public get builder() {
    return this.getOrSet('builder', Builder)
  }

  public get events() {
    return this.getOrSet('events', Events)
  }

  public get id() {
    return this.getOrSet('id', ID)
  }

  public get licenseManager() {
    return this.getOrSet('licenseManager', LicenseManager)
  }

  public get logger() {
    return this.getOrSet('logger', Logger)
  }

  public get messages() {
    return this.getOrSet('messages', Messages)
  }

  public get messagesGraphQL() {
    return this.getOrSet('messagesGraphQL', MessagesGraphQL)
  }

  public get metadata() {
    return this.getOrSet('metadata', Metadata)
  }

  public get registry() {
    return this.getOrSet('registry', Registry)
  }

  public get router() {
    return this.getOrSet('router', Router)
  }

  public get segment() {
    return this.getOrSet('segment', Segment)
  }

  public get settings() {
    return this.getOrSet('settings', Settings)
  }

  public get session() {
    return this.getOrSet('session', Session)
  }

  public get tenant() {
    return this.getOrSet('tenant', TenantClient)
  }

  public get vbase() {
    return this.getOrSet('vbase', VBase)
  }

  public get workspaces() {
    return this.getOrSet('workspaces', Workspaces)
  }

  protected getOrSet<TClient extends IOClientConstructor>(key: string, Implementation: TClient): InstanceType<TClient> {
    const options = {
      ...this.clientOptions.default,
      ...this.clientOptions[key],
      metrics,
    }

    if (!this.clients[key]) {
      this.clients[key] = new Implementation(this.ctx, options)
    }

    return this.clients[key] as InstanceType<TClient>
  }
}
