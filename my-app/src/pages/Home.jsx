import SearchForm from '../components/SearchForm.jsx';

export default function Home(){
    return (
        <div className = "flex flex-col justify-center items-center min-h-screen">
            <h1 className = "text-3xl font-bold text-white mb-6">Husky Helper</h1>
            <SearchForm className = ""/>
            <a href = "https://syllabus.uconn.edu/" className = "fixed bottom-0 text-white text-xl">UConn's Syllabus Repository</a>
        </div>
    );
}