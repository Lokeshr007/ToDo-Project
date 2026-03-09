import { Droppable } from '@hello-pangea/dnd';

const BoardView = ({ column = { id: 'default', tasks: [] } }) => {
    return (
        <Droppable 
            droppableId={column.id.toString()}
            isDropDisabled={false}
        >
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="min-h-[100px]"
                >
                    {/* Tasks would go here */}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    );
};

export default BoardView;
