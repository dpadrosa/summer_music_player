
import React, { ComponentProps, useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import clsx from 'clsx';

import Button from './Button';
import Card from './Card';
import styles from './styles.scss';

type CardWithId = ComponentProps<typeof Card> & {
  id: string;
  category?: string;
};

type CardRowProps = {
  cards: CardWithId[];
  header?: string;
  categories?: string[];
  filterPlaceholder?: string;
  nothingFoundLabel?: string;
};

const EmptyState: React.FC<{ nothingFoundLabel: string }> = ({ nothingFoundLabel }) => (
  <div className={styles.emptyState}>
    <div className={styles.emptyIcon}>
      <Search size={48} className={styles.searchIcon} />
      <X size={28} className={styles.closeIcon} />
    </div>
    <h2 className={styles.emptyText}>{nothingFoundLabel}</h2>
  </div>
);

const SCROLL_INCREMENT = 240;

const CardsRow: React.FC<CardRowProps> = ({
  cards,
  header,
  categories,
  filterPlaceholder = 'Search...',
  nothingFoundLabel = 'Nothing found!'
}) => {
  const cardsRowRef = useRef<HTMLDivElement>(null);
  const [displayedCards, setDisplayedCards] = useState(cards);
  const [filter, setFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const container = cardsRowRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      if (e.shiftKey) return;
      e.preventDefault();
      container.scrollLeft += e.deltaY;
    };

    container.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', onWheel);
    };
  }, []);

  const scrollCards = (direction: 1 | -1) => {
    if (cardsRowRef.current) {
      const newScroll = cardsRowRef.current.scrollLeft + direction * SCROLL_INCREMENT;
      cardsRowRef.current.scrollTo({ left: newScroll, behavior: 'smooth' });
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  const clearFilter = useCallback(() => {
    setFilter('');
  }, []);

  useEffect(() => {
    setDisplayedCards(
      cards.filter(card => {
        const matchFilter = card.header.toLowerCase().includes(filter.toLowerCase());
        const matchCategory = !selectedCategory || card.category === selectedCategory;
        return matchFilter && matchCategory;
      })
    );
  }, [cards, filter, selectedCategory]);

  return (
    <div className={clsx(styles.cardsRowContainer, 'neon-border')}>
      <div className={styles.headerRow}>
        <h2 className={clsx(styles.title, 'glow-text')}>{header}</h2>
      </div>

      <div className={styles.layout}>
        <div className={styles.searchRow}>
          <input
            type="text"
            value={filter}
            onChange={handleFilterChange}
            placeholder={filterPlaceholder}
            className={styles.inputFilter}
          />
          <Button className={styles.clearButton} onClick={clearFilter} icon={<X size={14} />} />
          <Button
            className={styles.scrollButton}
            onClick={() => scrollCards(-1)}
            icon={<ChevronLeft size={16} />}
          />
          <Button
            className={styles.scrollButton}
            onClick={() => scrollCards(1)}
            icon={<ChevronRight size={16} />}
          />
        </div>

        <div className={styles.sidebar}>
          {categories && (
            <div className={styles.categoryButtons}>
              {categories.map(category => (
                <Button
                  key={category}
                  onClick={() =>
                    setSelectedCategory(prev => (prev === category ? null : category))
                  }
                  className={clsx(
                    styles.categoryButton,
                    selectedCategory === category && styles.activeCategory
                  )}
                >
                  {category}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className={clsx(styles.cardsRow, 'scrollbar-hide')} ref={cardsRowRef}>
          {displayedCards.length > 0 ? (
            displayedCards.map(card => (
              <Card key={card.id} className={styles.rowCard} {...card} />
            ))
          ) : (
            <EmptyState nothingFoundLabel={nothingFoundLabel} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CardsRow;
