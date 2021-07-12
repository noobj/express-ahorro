import { IsString } from 'class-validator';

class CreateUserDto {
    @IsString()
    public account: string;

    @IsString()
    public password: string;

    @IsString()
    public coin: string;
}

export default CreateUserDto;
