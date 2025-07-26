import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import type { DataTablePageEvent, DataTableSelectionMultipleChangeEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import type { Artwork } from '../types/artwork';
import { fetchArtworks } from '../api/artworkApi';
import { useRowSelection } from '../hooks/useRowSelection';

const ROWS_PER_PAGE = 10;

export const ArtworkTable: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [allLoadedArtworks, setAllLoadedArtworks] = useState<Record<number, Artwork>>({});
  const [topNInput, setTopNInput] = useState(15);
  const [showDialog, setShowDialog] = useState(false);

  const { selectedIds, selectionInfo, selectRows, deselectRows } = useRowSelection();
  const currentPageSelections = artworks.filter(a => selectedIds.has(a.id));

  useEffect(() => {
    setLoading(true);
    fetchArtworks(page + 1, ROWS_PER_PAGE)
      .then(({ data, pagination }) => {
        setArtworks(data);
        setTotalRecords(pagination.total);
        setAllLoadedArtworks(prev => {
          const updated = { ...prev };
          data.forEach(item => {
            updated[item.id] = item;
          });
          return updated;
        });
      })
      .catch((error) => {
        console.error('Fetching artworks failed:', error);
        setArtworks([]);
        setTotalRecords(0);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const onPageChange = (event: DataTablePageEvent) => {
    setPage(event.page ?? 0);
  };

  const onSelectionChange = (event: DataTableSelectionMultipleChangeEvent<Artwork[]>) => {
    const selectedFromCurrent = event.value ?? [];
    const newlySelected = selectedFromCurrent.filter(a => !selectedIds.has(a.id));
    const newlyDeselected = artworks.filter(
      a => selectedIds.has(a.id) && !selectedFromCurrent.some(s => s.id === a.id)
    );

    if (newlySelected.length) {
      selectRows(newlySelected.map(a => ({ id: a.id, title: a.title })));
    }
    if (newlyDeselected.length) {
      deselectRows(newlyDeselected.map(a => a.id));
    }
  };

  const handleRemove = (id: number) => {
    deselectRows([id]);
  };

  const handleTopNSubmit = async () => {
    setLoading(true)
    const pagesToLoad = Math.ceil(topNInput / ROWS_PER_PAGE);
    let combinedArtworks: Artwork[] = [];

    for (let i = 1; i <= pagesToLoad; i++) {
      const { data } = await fetchArtworks(i, ROWS_PER_PAGE);
      combinedArtworks = [...combinedArtworks, ...data];
    }

    const topN = combinedArtworks.slice(0, topNInput);
    selectRows(topN.map(a => ({ id: a.id, title: a.title })));

    setAllLoadedArtworks(prev => {
      const updated = { ...prev };
      topN.forEach(item => {
        updated[item.id] = item;
      });
      return updated;
    });
    setLoading(false)
    setShowDialog(false);
  };

  const dropdown = (
    <div>
      <Button
        icon="pi pi-chevron-down"
        label=""
        onClick={() => setShowDialog(true)}
        size="small"
      />
      <Dialog
        header="Select Top N Artworks"
        visible={showDialog}
        style={{ width: '450px' }}
        onHide={() => setShowDialog(false)}
        footer={
          <div className="flex justify-end gap-2">
            {/* <Button label="Cancel" icon="pi pi-times" onClick={() => setShowDialog(false)} className="p-button-text" /> */}
            <Button label={loading?"wait...":"submit"} icon="pi pi-check" onClick={handleTopNSubmit} autoFocus />
          </div>
        }
      >
        <div className="flex flex-col gap-3">
          <label htmlFor="topN">Enter row</label>
          <input
            id="topN"
            type="number"
            min={1}
            value={topNInput}
            onChange={e => setTopNInput(Number(e.target.value))}
            className="p-inputtext p-component"
          />
        </div>
      </Dialog>
    </div>
  );

  return (
    <div>
      <DataTable
        value={artworks}
        paginator
        lazy
        rows={ROWS_PER_PAGE}
        first={page * ROWS_PER_PAGE}
        totalRecords={totalRecords}
        loading={loading}
        onPage={onPageChange}
        selection={currentPageSelections}
        onSelectionChange={onSelectionChange}
        selectionMode="checkbox"
        dataKey="id"
      >
        <Column
          selectionMode="multiple"
          header={dropdown}
          headerStyle={{ width: '1rem' }}
        />
        <Column field="title" header="Title" sortable />
        <Column field="place_of_origin" header="Place of Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Date Start" sortable />
        <Column field="date_end" header="Date End" sortable />
      </DataTable>
    </div>
  );
};
