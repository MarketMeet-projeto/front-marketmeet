export interface User {
    id: string;
    nome: string;
    username: string;
    avatar: string;
}

export interface Product {
    id: string;
    nome: string;
    categoria: string;
    nota: number;
    imagem: string;
}

export interface Post {
    id: string;
    author: User;
    createdAt: Date;
    content: {
        texto: string;
        midia?: string;
    };
    produto?: Product;
    interacoes: {
        curtidas: number;
        curtidoPor: string[];
        compartilhamentos: number;
    };
}