import { IsString } from 'class-validator';

class LogInDto {
    @IsString()
    public account: string;

    @IsString()
    public password: string;
}

export default LogInDto;
