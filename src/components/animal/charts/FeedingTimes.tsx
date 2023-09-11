import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);
import { Bar } from 'react-chartjs-2';


export default ({ feedingData }: { feedingData: any }) => {
    feedingData = feedingData.sort((a: any, b: any) => (new Date(a.date).getTime() - new Date(b.date).getTime()));
    const chartData = {
        labels: feedingData ? feedingData.map((item: any) => new Date(item.date).toLocaleDateString('en-ca')) : [],
        datasets: [
            {
                label: 'animals fed',
                data: feedingData ? feedingData.map((item: any) => item.amount) : [],
                borderColor: 'rgb(191, 149, 249)',
                backgroundColor: 'rgba(191, 149, 249, 0.5)',
            },
        ],
    }

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
        },
        maintainAspectRatio: false,
        scales: {
            x: {
                ticks: {
                    color: 'white',
                }
            },
            y: {
                ticks: {
                    color: 'white',
                }
            }
        }
    };

    return (
        <div className='max-h-60'>
            <Bar data={chartData} options={chartOptions} />
        </div>
    )
}