import { IsString } from 'class-validator';

class CreateUserDto {
    @IsString()
    public account: string;

    @IsString()
    public password: string;
}

export default CreateUserDto;
