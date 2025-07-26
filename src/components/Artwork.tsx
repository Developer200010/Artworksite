import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { fetchArtwork } from "../api/artworkApi";
import type { Artwork as ArtworkType } from '../types/artwork';
import { use, useEffect, useState } from "react";
const ROWS_PER_PAGE = 10;
export const Artwork: React.FC = () => {
    const [artwork, setArtwork] = useState<ArtworkType[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);

    //selecting checkbox 
    // const [selectedArtworks, setSelectedArtworks] = useState<ArtworkType[]>([]);

    //creating a dictionary to persist selected row by ID.
    const [selectedMap, setSelectedMap] = useState<Record<number,ArtworkType>>({});
    console.log(selectedMap)
    async function loadArtworks(pageIndex = 0) {
        setLoading(true);
        try {
            const result = await fetchArtwork(pageIndex + 1, ROWS_PER_PAGE);
            setArtwork(result.data);
            setTotalRecords(result.pagination.total);
        } catch (error) {
            console.log("failed to fetch artwork.");
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {

        loadArtworks(page)
    }, [page])

    //converting object to an array

    const selectedArtworks = Object.values(selectedMap);

    // handle check toggle
    const onSelectionChange = (e: {value:ArtworkType[]}) =>{
        const updateMap : Record<number, ArtworkType> = {...selectedMap};
        const currentPageId = new Set(artwork.map((a)=>a.id));

        for(const id of currentPageId){
            delete updateMap[id]
        }

        for(const item of e.value){
            updateMap[item.id] = item
        }
        setSelectedMap(updateMap)
    }

    return (
        <div className="card">
            <h3>Artwork table details</h3>
            <DataTable
                value={artwork}
                selection={selectedArtworks}
                onSelectionChange={onSelectionChange}
                loading={loading}
                lazy
                paginator
                totalRecords={totalRecords}
                rows={ROWS_PER_PAGE}
                first={page * ROWS_PER_PAGE}
                onPage={(e)=> setPage(e.page)}
                dataKey="id"
                tableStyle={{ minWidth: "60rem" }}
            >
                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
                <Column field="title" header="Title" />
                <Column field="artist_display" header="Artist" />
                <Column field="place_of_origin" header="Origin" />
                <Column field="date_start" header="Start Date" />
                <Column field="date_end" header="End Date" />
            </DataTable>
        </div>
    )
}

