export interface IBaseRepository<T, TCreate, TUpdate> {
    create(entity: TCreate): Promise<T>;
    findById(id: number): Promise<T | null>;
    update(id: number, updates: TUpdate): Promise<T | null>;
    delete(id: number): Promise<boolean>;
    findAll(): Promise<T[]>;
}
