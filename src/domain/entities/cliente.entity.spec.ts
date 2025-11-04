import { Cliente, ClienteProps } from './cliente.entity';

describe('Cliente (Entidade)', () => {
  const props: ClienteProps = {
    nome: 'Cliente Original',
    email: 'original@teste.com',
    telefone: '123456',
  };

  it('deve criar um cliente com propriedades básicas', () => {
    const cliente = new Cliente(props);

    expect(cliente.nome).toBe(props.nome);
    expect(cliente.email).toBe(props.email);
    expect(cliente.telefone).toBe(props.telefone);

    expect(cliente._id).toBeDefined();
    expect(cliente.createdAt).toBeInstanceOf(Date);
    expect(cliente.updatedAt).toBeInstanceOf(Date);
  });

  it('deve atualizar o nome usando updateInfo', () => {
    const cliente = new Cliente(props);
    const novoNome = 'Cliente Atualizado';

    cliente.updateInfo({ nome: novoNome });

    expect(cliente.nome).toBe(novoNome);
    expect(cliente.email).toBe(props.email);
  });

  it('deve atualizar o e-mail usando updateInfo', () => {
    const cliente = new Cliente(props);
    const novoEmail = 'novo@email.com';

    cliente.updateInfo({ email: novoEmail });

    expect(cliente.email).toBe(novoEmail);
    expect(cliente.nome).toBe(props.nome);
  });

  it('deve atualizar o telefone usando updateInfo', () => {
    const cliente = new Cliente(props);
    const novoTelefone = '987654';

    cliente.updateInfo({ telefone: novoTelefone });

    expect(cliente.telefone).toBe(novoTelefone);
  });

  it('deve atualizar múltiplos campos usando updateInfo', () => {
    const cliente = new Cliente(props);
    const novoNome = 'Nome Novo';
    const novoEmail = 'email@novo.com';

    cliente.updateInfo({ nome: novoNome, email: novoEmail });

    expect(cliente.nome).toBe(novoNome);
    expect(cliente.email).toBe(novoEmail);
    expect(cliente.telefone).toBe(props.telefone);
  });

  it('não deve atualizar campos se o DTO parcial estiver vazio', () => {
    const cliente = new Cliente(props);

    cliente.updateInfo({ nome: undefined, email: undefined });

    expect(cliente.nome).toBe(props.nome);
    expect(cliente.email).toBe(props.email);
  });
});
