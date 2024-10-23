export class Role {
    public static readonly VIEWER = new Role('viewer');
    public static readonly MAINTAINER = new Role('maintainer');

    private constructor(private readonly value: string) {}

    public toString(): string {
        return this.value;
    }

    public equals(other: Role): boolean {
        return this.value === other.value;
    }
}


type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';

export interface ApiRole {
    pathParameter: string;
    requiredRole: Role;
}

export interface ApiRoles {
    httpMethod: HttpMethod;
    apiRole: ApiRole[];
}