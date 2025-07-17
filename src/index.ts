import app from './app';
import EnvSecret from './constants/envVariables';

const port = EnvSecret.PORT || 3001;


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});