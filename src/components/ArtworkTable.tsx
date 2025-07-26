import { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import type { DataTableStateEvent } from 'primereact/datatable';

import type { Artwork } from '../types/artwork';
import { fetchArtworks } from '../api/artworkApi';
import { useRowSelection } from '../hooks/useRowSelection';

const ROWS_PER_PAGE = 10;

export const ArtworkTable: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [topNInput, setTopNInput] = useState(15);
  const [showDialog, setShowDialog] = useState(false);

  const { selectRows, deselectRows } = useRowSelection();
  const [selection, setSelection] = useState<Artwork[]>([]);

  useEffect(() => {
    setLoading(true);
    fetchArtworks(page + 1, ROWS_PER_PAGE)
      .then(({ data, pagination }) => {
        setArtworks(data);
        setTotalRecords(pagination.total);
      })
      .catch((error) => {
        console.error('Fetching artworks failed:', error);
        setArtworks([]);
        setTotalRecords(0);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const onPageChange = (event: DataTableStateEvent) => {
    setPage(event.page ?? 0);
  };

  const onSelectionChange = (event: { value: Artwork[] }) => {
    const selectedArtworks: Artwork[] = event.value ?? [];
    setSelection(selectedArtworks);
    selectRows(selectedArtworks.map(a => ({ id: a.id, title: a.title })));
  };

  const handleRemove = (id: number) => {
    deselectRows([id]);
    setSelection(prev => prev.filter(a => a.id !== id));
  };

  const handleTopNSubmit = async () => {
    setLoading(true);
    const pagesToLoad = Math.ceil(topNInput / ROWS_PER_PAGE);
    let combinedArtworks: Artwork[] = [];
    for (let i = 1; i <= pagesToLoad; i++) {
      const { data } = await fetchArtworks(i, ROWS_PER_PAGE);
      combinedArtworks = [...combinedArtworks, ...data];
    }
    const topN = combinedArtworks.slice(0, topNInput);
    setSelection(topN);
    selectRows(topN.map(a => ({ id: a.id, title: a.title })));
    setLoading(false);
    setShowDialog(false);
  };

  return (
    <div>
      <Button
        label="Select Top N"
        icon="pi pi-list"
        size="small"
        onClick={() => setShowDialog(true)}
        style={{ marginBottom: 14 }}
      />
      <Dialog
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        header="Select Top N Artworks"
        footer={
          <>
            <Button label="Cancel" onClick={() => setShowDialog(false)} className="p-button-text"/>
            <Button label="Select" onClick={handleTopNSubmit} disabled={loading}/>
          </>
        }
      >
        <div>
          <span>Enter row count: </span>
          <input
            type="number"
            min={1}
            max={100}
            value={topNInput}
            onChange={e => setTopNInput(Number((e.target as HTMLInputElement).value))}
            className="p-inputtext p-component"
            style={{ width: 80 }}
          />
        </div>
      </Dialog>
      <DataTable
        value={artworks}
        loading={loading}
        paginator
        lazy
        rows={ROWS_PER_PAGE}
        totalRecords={totalRecords}
        first={page * ROWS_PER_PAGE}
        onPage={onPageChange}
        selection={selection}
        onSelectionChange={onSelectionChange}
        selectionMode="multiple"
        dataKey="id"
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3em' }} />
        <Column field="id" header="ID" style={{ width: 80 }} />
        <Column field="title" header="Title" />
        <Column field="artist_display" header="Artist" />
        <Column field="place_of_origin" header="Origin" />
        <Column field="date_start" header="Start" />
        <Column field="date_end" header="End" />
        <Column
          header="Remove"
          body={(rowData: Artwork) =>
            selection.find(item => item.id === rowData.id) ? (
              <Button
                icon="pi pi-times"
                className="p-button-rounded p-button-danger p-button-sm"
                onClick={() => handleRemove(rowData.id)}
              />
            ) : null
          }
          style={{ width: 70, textAlign: 'center' }}
        />
      </DataTable>
    </div>
  );
};
