import { BaseEntity } from './base.entity';

export interface ClienteProps {
  nome: string;
  email: string;
  telefone: string;
}

export class Cliente extends BaseEntity {
  public nome: string;
  public email: string;
  public telefone: string;

  constructor(
    props: ClienteProps,
    baseProps?: { _id?: string; createdAt?: Date; updatedAt?: Date },
  ) {
    super(baseProps);
    this.nome = props.nome;
    this.email = props.email;
    this.telefone = props.telefone;
  }

  public updateInfo(props: Partial<ClienteProps>) {
    if (props.nome) {
      this.nome = props.nome;
    }
    if (props.email) {
      this.email = props.email;
    }
    if (props.telefone) {
      this.telefone = props.telefone;
    }
  }
}
