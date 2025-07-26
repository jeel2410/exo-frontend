import { ChangeEvent, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "./CreateRequestTable.tsx";

export interface Data {
  id: number;
  country: string;
  providence: string;
  city: string;
  municipality: string;
}

const AddressTable = ({
  data,
}: {
  data: Data[] | [];
  onDataChange?: (newData: Data[]) => void;
}) => {
  const [tableData, setTableData] = useState<Data[]>(data);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  useEffect(() => {
    setTableData(data);
  }, [data]);

  const handleSelectAll = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedRows(tableData.map((order) => order.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (orderId: number) => {
    setSelectedRows((prev) => {
      if (prev.includes(orderId)) {
        return prev.filter((id) => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };

  const tableHeader: TableHeader[] = [
    // {
    //   content: (
    //     <input
    //       type="checkbox"
    //       checked={tableData && selectedRows.length === tableData.length}
    //       onChange={handleSelectAll}
    //       className="w-4 h-4 rounded border-secondary-30 text-blue-600 focus:ring-blue-500"
    //       aria-label="Select all rows"
    //     />
    //   ),
    //   className: "w-10", // Fixed width for checkbox
    // },
    {
      content: <div>Sr No</div>,
      className: "w-16",
    },
    {
      content: <div>Country</div>,
      className: "min-w-[120px]",
    },
    {
      content: <div>Providence</div>,
      className: "min-w-[120px]",
    },
    {
      content: <div>City</div>,
      className: "min-w-[120px]",
    },
    {
      content: <div>Municipality</div>,
      className: "min-w-[120px]",
    },
  ];

  return (
    <div className="relative rounded-lg border border-secondary-30 bg-white ">
      <div className="relative">
        <Table>
          <TableHeader className="border-b border-gray-100 bg-secondary-10 rounded-lg">
            <TableRow>
              {tableHeader.map((header, index) => {
                return (
                  <TableCell
                    key={index}
                    isHeader
                    className="px-5 py-4 font-semibold text-secondary-50 text-left text-sm cursor-pointer"
                    onClick={header.onClick}
                  >
                    {header.content}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100">
            {tableData &&
              tableData.map((data) => {
                return (
                  <TableRow key={data.id}>
                    {/* <TableCell className="px-5 py-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(data.id)}
                        onChange={() => handleSelectRow(data.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        aria-label={`Select row ${data.id}`}
                      />
                    </TableCell> */}
                    <TableCell className="px-5 py-4 text-gray-500 text-sm">
                      {data.id}
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6">
                      <span className="block font-medium text-secondary-100 text-sm">
                        {data.country}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6">
                      <span className="block font-medium text-secondary-100 text-sm">
                        {data.providence}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6">
                      <span className="block font-medium text-secondary-100 text-sm">
                        {data.city}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6">
                      <span className="block font-medium text-secondary-100 text-sm">
                        {data.municipality}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AddressTable;
