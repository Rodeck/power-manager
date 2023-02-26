declare global {
    namespace NodeJS {
        interface ProcessEnv {
            USERNAME: string;
            NODE_ENV: 'development' | 'production';
            PORT?: string;
            PASSWORD: string;
        }
    }
}

export { }
